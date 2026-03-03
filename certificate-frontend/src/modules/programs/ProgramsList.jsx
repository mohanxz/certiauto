import React, { useState, useEffect } from 'react';
import { programAPI } from '../../api/programs';
import { batchAPI } from '../../api/batches'; // Add batchAPI import
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/ui/Button';
import ProgramCard from './ProgramCard';
import ProgramForm from './ProgramForm';
import { useToast } from '../../hooks/useToast';

const ProgramsList = () => {
  const [programs, setPrograms] = useState([]);
  const [programBatches, setProgramBatches] = useState({}); // Store batches by programId
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Fetch all programs
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getAllPrograms();
      if (response.success) {
        setPrograms(response.data);
        
        // After fetching programs, fetch batches for each program
        fetchBatchesForPrograms(response.data);
      }
    } catch (error) {
      showToast('Error fetching programs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch batches for each program
  const fetchBatchesForPrograms = async (programsList) => {
    try {
      const batchesMap = {};
      
      // Fetch batches for each program in parallel
      await Promise.all(
        programsList.map(async (program) => {
          try {
            const response = await batchAPI.getAllBatches({ 
              programId: program._id 
            });
            
            if (response.success) {
              batchesMap[program._id] = response.data;
            }
          } catch (error) {
            console.error(`Error fetching batches for program ${program._id}:`, error);
            batchesMap[program._id] = [];
          }
        })
      );
      
      setProgramBatches(batchesMap);
    } catch (error) {
      showToast('Error fetching batches data', 'error');
    }
  };

  // Get batch count for a specific program
  const getBatchCount = (programId) => {
    return programBatches[programId]?.length || 0;
  };

  const handleCreateProgram = async (programData) => {
    try {
      const response = await programAPI.createProgram(programData);
      if (response.success) {
        showToast('Program created successfully', 'success');
        setShowForm(false);
        fetchPrograms(); // Refresh the list
      }
    } catch (error) {
      showToast('Error creating program', 'error');
    }
  };

  const handleEditProgram = (program) => {
    setEditingProgram(program);
    setShowForm(true);
  };

  const handleUpdateProgram = async (programId, updatedData) => {
    try {
      const response = await programAPI.updateProgram(programId, updatedData);
      if (response.success) {
        showToast('Program updated successfully', 'success');
        setShowForm(false);
        setEditingProgram(null);
        fetchPrograms(); // Refresh the list
      }
    } catch (error) {
      showToast('Error updating program', 'error');
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to delete this program? This will also delete all associated batches and courses.')) {
      return;
    }

    try {
      const response = await programAPI.deleteProgram(programId);
      if (response.success) {
        showToast('Program deleted successfully', 'success');
        fetchPrograms(); // Refresh the list
      }
    } catch (error) {
      showToast('Error deleting program', 'error');
    }
  };

  const filteredPrograms = programs.filter(program =>
    program.programName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total batches across all programs
  const getStats = () => {
    const totalPrograms = programs.length;
    const totalBatches = Object.values(programBatches).reduce(
      (sum, batches) => sum + (batches?.length || 0), 
      0
    );
    
    return { totalPrograms, totalBatches };
  };

  const stats = getStats();

  if (loading && programs.length === 0) {
    return <LoadingSkeleton type="cards" count={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Programs</h1>
          <p className="text-gray-600">Manage your academic programs</p>
        </div>
        
        <Button
          onClick={() => {
            setEditingProgram(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
          icon="fas fa-plus"
          size="medium"
        >
          Create Program
        </Button>
      </div>

  

   

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <EmptyState
          title="No programs found"
          description={searchTerm ? 'Try changing your search' : 'Create your first program to get started'}
          icon="fas fa-project-diagram"
          actionText="Create Program"
          onAction={() => {
            setEditingProgram(null);
            setShowForm(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <ProgramCard
              key={program._id}
              program={program}
              batchCount={getBatchCount(program._id)} // Pass batch count
              onEdit={handleEditProgram}
              onDelete={handleDeleteProgram}
            />
          ))}
        </div>
      )}

      {/* Program Form Modal */}
      {showForm && (
        <ProgramForm
          onSubmit={editingProgram ? 
            (data) => handleUpdateProgram(editingProgram._id, data) : 
            handleCreateProgram
          }
          onClose={() => {
            setShowForm(false);
            setEditingProgram(null);
          }}
          initialData={editingProgram}
          title={editingProgram ? 'Edit Program' : 'Create New Program'}
        />
      )}
    </div>
  );
};

export default ProgramsList;
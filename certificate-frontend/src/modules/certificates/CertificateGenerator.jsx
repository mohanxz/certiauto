import React from 'react';
import Button from '../../components/ui/Button';

const CertificateGenerator = () => {
  const steps = [
    { number: 1, title: 'Select Course', completed: true },
    { number: 2, title: 'Select Batch', completed: true },
    { number: 3, title: 'Select Students', completed: false },
    { number: 4, title: 'Choose Template', completed: false },
    { number: 5, title: 'Generate & Email', completed: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Certificate Generator</h1>
        <p className="text-gray-600">Generate and email certificates to students</p>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${step.completed 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-400'
                }
              `}>
                {step.completed ? (
                  <i className="fas fa-check text-xs"></i>
                ) : (
                  step.number
                )}
              </div>
              <span className={`ml-2 ${step.completed ? 'text-blue-600' : 'text-gray-600'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${step.completed ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 3: Select Students</h3>
          <p className="text-gray-600 mb-6">Select the students who will receive certificates</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-user text-blue-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">John Doe</p>
                  <p className="text-sm text-gray-600">john@example.com</p>
                </div>
              </div>
              <input type="checkbox" className="w-4 h-4 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-user text-blue-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Jane Smith</p>
                  <p className="text-sm text-gray-600">jane@example.com</p>
                </div>
              </div>
              <input type="checkbox" className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="secondary">
            <i className="fas fa-arrow-left mr-2"></i>Previous
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Next <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
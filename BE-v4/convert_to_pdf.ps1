param([string]$inputFile, [string]$outputFile)

try {
    Write-Host "Starting Word Application..."
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0

    # 🔥 Disable field updates globally
    $word.Options.UpdateFieldsAtPrint = $false
    $word.Options.UpdateLinksAtPrint = $false

    Write-Host "Opening document: $inputFile"
    $doc = $word.Documents.Open($inputFile, $false, $true)

    # 🔥 VERY IMPORTANT: Disable auto field update on open
    $doc.Fields.Locked = $true

    # Automatically detect orientation for each section
    Write-Host "Detecting orientation for each section..."
    foreach ($section in $doc.Sections) {
        $pageSetup = $section.PageSetup
        
        # Get page dimensions
        $width = $pageSetup.PageWidth
        $height = $pageSetup.PageHeight
        
        # Determine orientation based on dimensions
        if ($height -gt $width) {
            # Height is greater than width - Portrait
            Write-Host "  Section: Portrait detected (Height: $height, Width: $width)"
            $pageSetup.Orientation = 0  # wdOrientPortrait
        } else {
            # Width is greater than or equal to height - Landscape
            Write-Host "  Section: Landscape detected (Height: $height, Width: $width)"
            $pageSetup.Orientation = 1  # wdOrientLandscape
        }
    }

    Write-Host "Exporting to PDF: $outputFile"

    # 🔥 Use ExportAsFixedFormat WITHOUT triggering updates
    $doc.ExportAsFixedFormat(
        $outputFile,
        17,      # wdExportFormatPDF
        $false,  # OpenAfterExport
        0,       # OptimizeFor (Print)
        0,       # Range
        0,
        0,
        0,
        $true,
        $true,
        0,
        $false,
        $false,
        $false
    )

    Write-Host "Done."
}
catch {
    Write-Error $_
    exit 1
}
finally {
    if ($doc) { $doc.Close($false) }
    if ($word) { $word.Quit() }
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
try {
    $word = New-Object -ComObject Word.Application
    Write-Host "Word Verified"
    $word.Quit()
} catch {
    Write-Host "Word Not Found"
    Write-Error $_
}

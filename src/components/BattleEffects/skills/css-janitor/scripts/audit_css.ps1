$reportFile = "unused_css_report.txt"
"VANILLA CSS AUDIT: $(Get-Date)" | Out-File -FilePath $reportFile -Encoding utf8
"Target Directory: ./src/components" | Out-File -FilePath $reportFile -Append -Encoding utf8
"------------------------------------------" | Out-File -FilePath $reportFile -Append -Encoding utf8

Write-Host "Starting audit of /src/components..."

$cssFiles = Get-ChildItem -Path "./src/components" -Filter "*.css" -Recurse

foreach ($cssFile in $cssFiles) {
    $folder = $cssFile.DirectoryName
    $componentName = $folder | Split-Path -Leaf
    $content = Get-Content $cssFile.FullName -Raw
    
    # Regex to find classes: .className followed by space, comma, brace, or colon
    $matches = [regex]::Matches($content, '(?<=\.)[a-zA-Z0-9_-]+(?=[\s,{:])')
    $classes = $matches | ForEach-Object { $_.Value } | Select-Object -Unique

    $tsxFiles = Get-ChildItem -Path $folder -Filter "*.tsx"

    foreach ($class in $classes) {
        $found = $false
        foreach ($tsx in $tsxFiles) {
             # Replicating grep behavior: checking if the class string exists anywhere in the file
            if (Select-String -Path $tsx.FullName -Pattern $class -Quiet -SimpleMatch) {
                $found = $true
                break
            }
        }
        if (-not $found) {
            $msg = "[$componentName] Unused class: .$class"
            Write-Host $msg
            $msg | Out-File -FilePath $reportFile -Append -Encoding utf8
        }
    }
}
"------------------------------------------" | Out-File -FilePath $reportFile -Append -Encoding utf8
Write-Host "Audit Complete. Summary saved to $reportFile"

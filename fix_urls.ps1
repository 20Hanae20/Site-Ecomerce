$srcPath = "c:\Users\Hanae\Desktop\Project Hanae TS FS-202\Site-Ecomerce\frontend\src"
$files = Get-ChildItem -Path $srcPath -Recurse -Include "*.jsx","*.js"
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    if ($content -match "8002") {
        $content = $content -replace "http://127\.0\.0\.1:8002", "http://127.0.0.1:8000"
        Set-Content $f.FullName $content -NoNewline
        Write-Host ("Fixed: " + $f.Name)
    }
}

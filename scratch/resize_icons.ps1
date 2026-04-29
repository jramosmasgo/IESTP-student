Add-Type -AssemblyName System.Drawing
function Resize-Image {
    param (
        [string]$Path,
        [int]$Width,
        [int]$Height,
        [string]$Destination
    )
    $img = [System.Drawing.Image]::FromFile($Path)
    $newImg = New-Object System.Drawing.Bitmap($Width, $Height)
    $g = [System.Drawing.Graphics]::FromImage($newImg)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $Width, $Height)
    $newImg.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $newImg.Dispose()
    $img.Dispose()
}

$root = "c:\Users\Jean\Documents\Proyectos\nextjs\prototype-student-attendance"
$src = Join-Path $root "public\logo\iesdtp-logo.png"

# Resize to 192
Resize-Image -Path $src -Width 192 -Height 192 -Destination (Join-Path $root "public\icon-192-new.png")
# Resize to 512
Resize-Image -Path $src -Width 512 -Height 512 -Destination (Join-Path $root "public\icon-512-new.png")

# Move/Rename
Move-Item -Path (Join-Path $root "public\icon-192-new.png") -Destination (Join-Path $root "public\icon-192.png") -Force
Move-Item -Path (Join-Path $root "public\icon-512-new.png") -Destination (Join-Path $root "public\icon-512.png") -Force

Write-Host "Icons resized and updated successfully"

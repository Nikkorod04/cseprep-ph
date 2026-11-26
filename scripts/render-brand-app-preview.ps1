Add-Type -AssemblyName System.Drawing

$files = @(
  @{ path = "screenshots\v6-onboarding.png"; label = "Onboarding - brand mark and wordmark" },
  @{ path = "screenshots\v6-home.png"; label = "App bar - mark on every tab" },
  @{ path = "screenshots\v6-profile-about.png"; label = "Profile - About card mark" }
)
$imgW = 390
$imgH = 844
$pad = 16
$capH = 34
$gap = 18
$width = $imgW + 2 * $pad
$height = 2 * $pad + $files.Count * ($capH + $imgH) + ($files.Count - 1) * $gap

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.ColorTranslator]::FromHtml("#0B1B3A"))
$font = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$brush = [System.Drawing.Brushes]::White

$y = $pad
foreach ($f in $files) {
  $g.DrawString($f.label, $font, $brush, [float]$pad, [float]$y)
  $y += $capH
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $f.path))
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle($pad, $y, $imgW, $imgH)))
  $img.Dispose()
  $y += $imgH + $gap
}

$bmp.Save("screenshots\brand-in-app.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
"saved brand-in-app.png"

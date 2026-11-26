Add-Type -AssemblyName System.Drawing

$W = 1400
$H = 980
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.ColorTranslator]::FromHtml("#0B1B3A"))

$white = [System.Drawing.Color]::White
$muted = [System.Drawing.ColorTranslator]::FromHtml("#A9B6D0")
$blue = [System.Drawing.ColorTranslator]::FromHtml("#1A46C4")

$titleFont = New-Object System.Drawing.Font("Segoe UI", 28, [System.Drawing.FontStyle]::Bold)
$labelFont = New-Object System.Drawing.Font("Segoe UI", 17, [System.Drawing.FontStyle]::Bold)
$smallFont = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Regular)
$tinyFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)

$whiteBrush = New-Object System.Drawing.SolidBrush($white)
$mutedBrush = New-Object System.Drawing.SolidBrush($muted)

$g.DrawString("CSE Prep PH - brand concepts", $titleFont, $whiteBrush, 40, 26)
$g.DrawString("Vector-built icon and splash directions", $smallFont, $mutedBrush, 42, 74)

$iconA = [System.Drawing.Image]::FromFile((Resolve-Path "assets\branding\icon-a2.png"))
$iconB = [System.Drawing.Image]::FromFile((Resolve-Path "assets\branding\icon-b.png"))
$splash = [System.Drawing.Image]::FromFile((Resolve-Path "assets\branding\splash-a2.png"))

function Add-RoundedRect($path, $x, $y, $w, $h, $r) {
  $d = 2 * $r
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
}

$g.DrawImage($iconA, (New-Object System.Drawing.Rectangle(60, 124, 360, 360)))
$g.DrawString("A - C + check", $labelFont, $whiteBrush, 60, 500)
$g.DrawString("Distinctive monogram with a pass check.", $smallFont, $mutedBrush, 60, 528)
$g.DrawString("Refined check sits inside the C opening.", $smallFont, $mutedBrush, 60, 548)

$g.DrawImage($iconB, (New-Object System.Drawing.Rectangle(470, 124, 360, 360)))
$g.DrawString("B - Document + check", $labelFont, $whiteBrush, 470, 500)
$g.DrawString("Clear exam/reviewer meaning.", $smallFont, $mutedBrush, 470, 528)
$g.DrawString("Safer, more literal, less ownable.", $smallFont, $mutedBrush, 470, 548)

# Launcher-size checks
$g.DrawImage($iconA, (New-Object System.Drawing.Rectangle(60, 620, 128, 128)))
$g.DrawImage($iconA, (New-Object System.Drawing.Rectangle(220, 652, 64, 64)))
$g.DrawString("A", $tinyFont, $mutedBrush, 60, 760)
$g.DrawString("128 px", $tinyFont, $mutedBrush, 60, 780)
$g.DrawString("64 px", $tinyFont, $mutedBrush, 220, 728)

$g.DrawImage($iconB, (New-Object System.Drawing.Rectangle(360, 620, 128, 128)))
$g.DrawImage($iconB, (New-Object System.Drawing.Rectangle(520, 652, 64, 64)))
$g.DrawString("B", $tinyFont, $mutedBrush, 360, 760)
$g.DrawString("128 px", $tinyFont, $mutedBrush, 360, 780)
$g.DrawString("64 px", $tinyFont, $mutedBrush, 520, 728)

$g.DrawString("Launcher-size check", $labelFont, $whiteBrush, 60, 820)
$g.DrawString("Look at both at 64 px before choosing.", $smallFont, $mutedBrush, 60, 850)

# Splash phone mock
$phonePath = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-RoundedRect $phonePath 980 120 360 760 34
$phoneBrush = New-Object System.Drawing.SolidBrush($blue)
$g.FillPath($phoneBrush, $phonePath)
$phonePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), 1)
$g.DrawPath($phonePen, $phonePath)

$g.DrawImage($splash, (New-Object System.Drawing.Rectangle(1000, 340, 320, 320)))
$g.DrawString("Splash - Concept A", $labelFont, $whiteBrush, 980, 900)
$g.DrawString("Blue field, white mark, gold tagline.", $smallFont, $mutedBrush, 980, 928)

$bmp.Save("screenshots\brand-preview.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$iconA.Dispose()
$iconB.Dispose()
$splash.Dispose()
"brand preview saved"

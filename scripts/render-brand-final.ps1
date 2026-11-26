Add-Type -AssemblyName System.Drawing

$W = 1200
$H = 820
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.ColorTranslator]::FromHtml("#0B1B3A"))

$white = [System.Drawing.Color]::White
$muted = [System.Drawing.ColorTranslator]::FromHtml("#A9B6D0")
$blue = [System.Drawing.ColorTranslator]::FromHtml("#1A46C4")

$titleFont = New-Object System.Drawing.Font("Segoe UI", 26, [System.Drawing.FontStyle]::Bold)
$labelFont = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold)
$smallFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
$tinyFont = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)

$whiteBrush = New-Object System.Drawing.SolidBrush($white)
$mutedBrush = New-Object System.Drawing.SolidBrush($muted)
$blueBrush = New-Object System.Drawing.SolidBrush($blue)

$g.DrawString("CSE Prep PH - final brand", $titleFont, $whiteBrush, 40, 24)
$g.DrawString("Concept A - C + check - blue #1A46C4 - gold #F2B01E", $smallFont, $mutedBrush, 42, 66)

$icon = [System.Drawing.Image]::FromFile((Resolve-Path "assets\icon.png"))
$foreground = [System.Drawing.Image]::FromFile((Resolve-Path "assets\android-icon-foreground.png"))
$splash = [System.Drawing.Image]::FromFile((Resolve-Path "assets\splash-icon.png"))

$g.DrawImage($icon, (New-Object System.Drawing.Rectangle(60, 110, 350, 350)))
$g.DrawString("App icon - 1024", $labelFont, $whiteBrush, 60, 476)
$g.DrawString("Full-bleed, safe for iOS rounding.", $smallFont, $mutedBrush, 60, 502)

$g.DrawImage($icon, (New-Object System.Drawing.Rectangle(60, 590, 64, 64)))
$g.DrawString("64 px", $tinyFont, $mutedBrush, 60, 660)
$g.DrawString("Launcher size", $smallFont, $mutedBrush, 60, 680)

# Adaptive circle preview
$circle = New-Object System.Drawing.Drawing2D.GraphicsPath
$circle.AddEllipse(470, 110, 350, 350)
$g.FillPath($blueBrush, $circle)
$g.SetClip($circle)
$g.DrawImage($foreground, (New-Object System.Drawing.Rectangle(470, 110, 350, 350)))
$g.ResetClip()
$ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 255, 255, 255), 2)
$g.DrawEllipse($ringPen, 470, 110, 350, 350)
$g.DrawString("Android adaptive", $labelFont, $whiteBrush, 470, 476)
$g.DrawString("Foreground inside the 66% safe zone.", $smallFont, $mutedBrush, 470, 502)

# Splash phone mock
$phonePath = New-Object System.Drawing.Drawing2D.GraphicsPath
$d = 56
$px = 900; $py = 90; $pw = 280; $ph = 620
$phonePath.AddArc($px, $py, $d, $d, 180, 90)
$phonePath.AddArc($px + $pw - $d, $py, $d, $d, 270, 90)
$phonePath.AddArc($px + $pw - $d, $py + $ph - $d, $d, $d, 0, 90)
$phonePath.AddArc($px, $py + $ph - $d, $d, $d, 90, 90)
$phonePath.CloseFigure()
$g.FillPath($blueBrush, $phonePath)
$phonePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), 1)
$g.DrawPath($phonePen, $phonePath)

$g.DrawImage($splash, (New-Object System.Drawing.Rectangle(910, 250, 260, 260)))
$g.DrawString("Splash screen", $labelFont, $whiteBrush, 900, 724)
$g.DrawString("Blue field, mark, wordmark, gold tagline.", $smallFont, $mutedBrush, 900, 748)

$g.DrawString("Icon A2, adaptive A2, splash A2", $tinyFont, $mutedBrush, 60, 760)

$bmp.Save("screenshots\brand-final.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$icon.Dispose()
$foreground.Dispose()
$splash.Dispose()
"brand-final saved"

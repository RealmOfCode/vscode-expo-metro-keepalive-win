param (
	[string]$outputPath,
	[string]$npxPath,
	[string]$keepAlivePath,
	[string]$projectPath
)

# ASCII art message
$asciiArt = @'
EEEEEEEEEEEEEEEEEEEEEE
E::::::::::::::::::::E
E::::::::::::::::::::E
EE::::::EEEEEEEEE::::E
  E:::::E       EEEEEExxxxxxx      xxxxxxxppppp   ppppppppp      ooooooooooo
  E:::::E              x:::::x    x:::::x p::::ppp:::::::::p   oo:::::::::::oo
  E::::::EEEEEEEEEE     x:::::x  x:::::x  p:::::::::::::::::p o:::::::::::::::o
  E:::::::::::::::E      x:::::xx:::::x   pp::::::ppppp::::::po:::::ooooo:::::o
  E:::::::::::::::E       x::::::::::x     p:::::p     p:::::po::::o     o::::o
  E::::::EEEEEEEEEE        x::::::::x      p:::::p     p:::::po::::o     o::::o
  E:::::E                  x::::::::x      p:::::p     p:::::po::::o     o::::o
  E:::::E       EEEEEE    x::::::::::x     p:::::p    p::::::po::::o     o::::o
EE::::::EEEEEEEE:::::E   x:::::xx:::::x    p:::::ppppp:::::::po:::::ooooo:::::o
E::::::::::::::::::::E  x:::::x  x:::::x   p::::::::::::::::p o:::::::::::::::o
E::::::::::::::::::::E x:::::x    x:::::x  p::::::::::::::pp   oo:::::::::::oo
EEEEEEEEEEEEEEEEEEEEEExxxxxxx      xxxxxxx p::::::pppppppp       ooooooooooo
                      _                    p:::::p   ______ __                        _________________
           /\/\   ___| |_ _ __ ___         p:::::p   ___  //_/_________________       ___    |__  /__(_)__   ______
          /    \ / _ \ __| '__/ _ \       p:::::::p  __  ,<  _  _ \  _ \__  __ \________  /| |_  /__  /__ | / /  _ \
         / /\/\ \  __/ |_| | | (_) |      p:::::::p  _  /| | /  __/  __/_  /_/ //_____/  ___ |  / _  / __ |/ //  __/
         \/    \/\___|\__|_|  \___/       p:::::::p  /_/ |_| \___/\___/_  .___/       /_/  |_/_/  /_/  _____/ \___/
                                          ppppppppp                    /_/
'@

# Start the expo process
$expoProcess = Start-Process -NoNewWindow -FilePath $npxPath -ArgumentList "expo start -c --tunnel" -PassThru
# Start the keep-alive process
$keepAliveProcess = Start-Process -NoNewWindow -FilePath "node" -ArgumentList "`"$keepAlivePath`" `"$projectPath`"" -PassThru

Clear-Host

Write-Host $asciiArt

$exitCode = -1

try {
	while ($true) {
		if ($expoProcess.HasExited -or $keepAliveProcess.HasExited) {
			if (-not $expoProcess.HasExited) {
				$expoProcess.Kill()
			}
			if (-not $keepAliveProcess.HasExited) {
				$keepAliveProcess.Kill()
			}
			$exitCode = 1
			break
		}
		Start-Sleep -Seconds 1
	}
	if ($exitCode -eq -1) {
		$exitCode = 0
	}
}
catch {
	if ($_.Exception -is [System.Management.Automation.Host.HostException]) {
		Write-Host "CTRL+C detected. Stopping processes..."
	}
 else {
		Write-Host "An error occurred: $($_.Exception.Message)"
	}
	$exitCode = 1
	if (-not $expoProcess.HasExited) {
		$expoProcess.Kill()
	}
	if (-not $keepAliveProcess.HasExited) {
		$keepAliveProcess.Kill()
	}
}
finally {
	$exitCode | Out-File -FilePath $outputPath -Force
	exit $exitCode
}



# param (
# 	[string]$outputPath,
# 	[string]$npxPath,
# 	[string]$keepAlivePath,
# 	[string]$projectPath
# )

# # Start the expo process
# $expoProcess = Start-Process -NoNewWindow -FilePath $npxPath -ArgumentList "expo start -c --tunnel" -PassThru
# # Start the keep-alive process
# $keepAliveProcess = Start-Process -NoNewWindow -FilePath "node" -ArgumentList "`"$keepAlivePath`" `"$projectPath`"" -PassThru

# Clear-Host

# $exitCode = -1

# # Start
# try {
# 	while ($true) {
# 		if ($expoProcess.HasExited -or $keepAliveProcess.HasExited) {
# 			if (-not $expoProcess.HasExited) {
# 				$expoProcess.Kill()
# 			}
# 			if (-not $keepAliveProcess.HasExited) {
# 				$keepAliveProcess.Kill()
# 			}
# 			$exitCode = 1
# 			break
# 		}
# 		Start-Sleep -Seconds 1
# 	}
# 	if ($exitCode -eq -1) {
# 		$exitCode = 0
# 	}
# }
# catch {
# 	if (-not $expoProcess.HasExited) {
# 		$expoProcess.Kill()
# 	}
# 	if (-not $keepAliveProcess.HasExited) {
# 		$keepAliveProcess.Kill()
# 	}
# 	$exitCode = 1
# }
# # End

# $exitCode | Out-File -FilePath $outputPath -Force
# exit $exitCode;

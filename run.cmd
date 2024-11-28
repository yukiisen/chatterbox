@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\server.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  cd %~dp0
  node  "%~dp0\server.js" %*
)
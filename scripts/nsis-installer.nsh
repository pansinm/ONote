!macro customInstall
  EnVar::AddValue "PATH" "$INSTDIR\resources\bin"
!macroend

!macro customUnInstall
  EnVar::DeleteValue "PATH" "$INSTDIR\resources\bin"
!macroend

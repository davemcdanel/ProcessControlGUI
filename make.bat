@ECHO off
SET TS=1
FOR /f "delims=" %%A IN ('cd') DO (
     SET TARGET=%%~nxA
	 SET TARGET_DIR=%%~dfA
    )
SET BUILDID=%DATE%-%TIME%
SET COMMIT_COMMENT=Automatic commit of successful build.
SET RUN_COMMENT=Automatic commit of successful run.
SET REMOTE_USER=pitmaster
SET REMOTE_GROUP=www-data
SET REMOTE_HOST=smokeshack
SET REMOTE_PATH=/home/pitmaster/www/
SET LOCAL_PATH=/cygdrive/d/Projects/
SET LOCAL_PUB_KEY=/cygdrive/d/Projects/key/smokeshack_v0.01

SET arg="%1"
IF /I "%1"=="-j12" SET arg="%2"
IF /I arg=="" SET arg="default"

ECHO CHECK3
rem enviroment vars to help cwRsync
SET CWRSYNCHOME=C:\PROGRAM FILES\CWRSYNC
SET PATH=%CWRSYNCHOME%\BIN;%PATH%
SET HOME=C:\Program Files\cwRsync\bin
SET CWOLDPATH=%PATH%
SET CYGWIN=nontsec
rem end cwRsync stuff

IF %TS%==1 ECHO TS=%TS%
IF %TS%==1 ECHO TARGET=%TARGET%
IF %TS%==1 ECHO TARGET_DIR=%TARGET_DIR%
IF %TS%==1 ECHO BUILDID=%BUILDID%
IF %TS%==1 ECHO COMMIT_COMMENT=%COMMIT_COMMENT%
IF %TS%==1 ECHO RUN_COMMENT=%RUN_COMMENT%
IF %TS%==1 ECHO REMOTE_USER=%REMOTE_USER%
IF %TS%==1 ECHO REMOTE_HOST=%REMOTE_HOST%
IF %TS%==1 ECHO REMOTE_PATH=%REMOTE_PATH%
IF %TS%==1 ECHO LOCAL_PATH=%LOCAL_PATH%
IF %TS%==1 ECHO LOCAL_PUB_KEY=%LOCAL_PUB_KEY%
IF %TS%==1 ECHO arg=%arg%

IF /I %arg%=="" GOTO :default
IF /I %arg%=="default" GOTO :default
IF /I %arg%=="init" GOTO :init
IF /I %arg%=="push" GOTO :push
IF /I %arg%=="pull" GOTO :pull
IF /I %arg%=="commit" GOTO :commit
IF /I %arg%=="run" GOTO :run
IF /I %arg%=="install" GOTO :install

:default
ECHO DEFAULT
rem Use the --dry-run option to show what would happen
rem Push to the server, Run on the server, Pull from the server to get program output files.
rem Just go to the project directory and get the path.  Just to see if things are working.
rem ssh -i '%LOCAL_PUB_KEY%' %REMOTE_USER%@%REMOTE_HOST% "cd %REMOTE_PATH%/%TARGET%;pwd;exit;"
rem Push to the server with rsync.
rsync --exclude='.git/' -rtvze "ssh -i '%LOCAL_PUB_KEY%'" "%LOCAL_PATH%/%TARGET%" %REMOTE_USER%@%REMOTE_HOST%:"'%REMOTE_PATH%'"
rem Run a "make" on the server in our project directory.
ssh -i '%LOCAL_PUB_KEY%' '%REMOTE_USER%@%REMOTE_HOST%' "cd %REMOTE_PATH%;chown -R %REMOTE_USER%:%REMOTE_GROUP% %REMOTE_PATH%/%TARGET%;exit;"
rem 2>&1 | sed 's=/=\\\=g'
rem Pull from the server to get the updated program output files.
rem rsync --exclude='.git/' -rtvze "ssh -i '%LOCAL_PUB_KEY%'" %REMOTE_USER%@%REMOTE_HOST%:"'%REMOTE_PATH%/%TARGET%'" "%LOCAL_PATH%"
GOTO :eof

:init
ECHO INIT
rem Push to the server with rsync.
rsync --exclude='.git/' -rtvze "ssh -o StrictHostKeyChecking=no -i %LOCAL_PUB_KEY%" '%LOCAL_PATH%/%TARGET%' '%REMOTE_USER%@%REMOTE_HOST%':'%REMOTE_PATH%'
GOTO :eof



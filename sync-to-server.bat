@echo off
title TSAR IT Billing - Synchronize Local to Server
echo =================================================================
echo  Synchronizing TSAR IT Billing (Local to 72.62.228.102)
echo =================================================================
python "%~dp0sync_billing.py"
pause

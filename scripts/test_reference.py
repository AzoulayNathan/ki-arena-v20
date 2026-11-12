from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parents[1]
sys.exit(subprocess.call([sys.executable,'-m','unittest','discover','-s','tests','-v'],cwd=root/'reference-survie'))

"""Gate for a release certified final: a candidate with FAIL/BLOCKED returns 1."""
from pathlib import Path
import sys
s=(Path(__file__).resolve().parents[1]/'STATUS_V9.md').read_text(encoding='utf-8')
rows=[r for r in s.splitlines() if r.startswith('|') and ('| FAIL |' in r or '| BLOCKED |' in r)]
if rows:
 print('La certification finale reste refusée :')
 print('\n'.join(rows));sys.exit(1)
print('Tous les critères de certification finale sont PASS.')

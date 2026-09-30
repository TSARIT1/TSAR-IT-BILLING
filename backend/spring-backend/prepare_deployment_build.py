from pathlib import Path

root = Path(__file__).resolve().parent
pom = (root / "pom.xml").read_text(encoding="utf-8")
pom = pom.replace("<build>", "<build>\n        <finalName>billing-backend-deploy-20260914</finalName>", 1)
(root / ".deployment-pom.xml").write_text(pom, encoding="utf-8")

import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("72.62.228.102", port=22, username="root", password="Tsarit@12345", timeout=10)

queries = """
ALTER TABLE products DROP FOREIGN KEY FK8dih18h4bkb8xatra6hp14241;
ALTER TABLE products DROP FOREIGN KEY FK94r303ufvg29s8com86u82fn5;
ALTER TABLE products MODIFY COLUMN godown_id VARCHAR(255) NULL;
ALTER TABLE products MODIFY COLUMN user_business_id VARCHAR(255) NULL;
ALTER TABLE products ADD CONSTRAINT FK_godown FOREIGN KEY (godown_id) REFERENCES godowns(godown_id) ON DELETE SET NULL;
ALTER TABLE products ADD CONSTRAINT FK_user_business FOREIGN KEY (user_business_id) REFERENCES user_business(user_business_id) ON DELETE SET NULL;
"""

cmd = f"mysql -u root -p'Tsarit@12345' billing_db -e \"{queries}\""
sin, sout, serr = ssh.exec_command(cmd)
print("OUT:", sout.read().decode())
print("ERR:", serr.read().decode())

ssh.close()

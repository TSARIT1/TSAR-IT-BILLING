import paramiko
import sys

sys.stdout.reconfigure(encoding="utf-8")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("72.62.228.102", port=22, username="root", password="Tsarit@12345", timeout=10)

def cmd(c):
    print(f"\n[EXEC] {c}")
    sin, sout, serr = ssh.exec_command(c)
    out = sout.read().decode("utf-8", errors="ignore").strip()
    err = serr.read().decode("utf-8", errors="ignore").strip()
    if out:
        print(out)
    if err:
        print("ERR:", err)
    return out

# 1. List current Kafka topics via docker container rynaty-kafka
cmd("docker exec rynaty-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list || echo 'Trying kafka container'")

# 2. Create billing topics
cmd("docker exec rynaty-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --if-not-exists --topic billing-invoices --partitions 1 --replication-factor 1")
cmd("docker exec rynaty-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --if-not-exists --topic billing-notifications --partitions 1 --replication-factor 1")
cmd("docker exec rynaty-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --if-not-exists --topic billing-audit --partitions 1 --replication-factor 1")

# 3. Verify topics
cmd("docker exec rynaty-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list")

# 4. Check Kubernetes k3s Tsar-billing namespace & deployments
cmd("kubectl get ns")
cmd("kubectl create namespace tsar-billing --dry-run=client -o yaml | kubectl apply -f -")
cmd("kubectl get pods -n tsar-billing")

ssh.close()
print("\nKafka & Kubernetes inspection completed.")

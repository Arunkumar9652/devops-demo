# DevOps Demo: Build → Test → Deploy to AWS EC2

Every `git push` to `main` will:
1. **Build**: install Node and build a Docker image
2. **Test**: run unit tests, then smoke-test the running container
3. **Deploy**: SSH into your EC2 server, rebuild, and restart the app

```
You push code → GitHub Actions → tests pass? → SSH to EC2 → Docker runs app on port 80
```

---

## Part A: Run it on your laptop (10 min)

```bash
npm test                 # BUILD + TEST locally (3 tests should pass)
npm start                # open http://localhost:3000
```

With Docker:
```bash
docker build -t devops-demo .
docker run -p 3000:3000 devops-demo
curl http://localhost:3000/health
```

---

## Part B: Create the EC2 server (15 min)

1. AWS Console → **EC2 → Launch instance**
   - Name: `devops-demo`
   - AMI: **Amazon Linux 2023**
   - Type: **t3.micro** (free-plan eligible)
   - Key pair: **Create new** → `devops-key` → download the `.pem` file
   - Security group: allow **SSH (22)** from *My IP* and **HTTP (80)** from *Anywhere*
2. Launch, then copy the **Public IPv4 address**.
3. Connect and install Docker + Git:
   ```bash
   chmod 400 devops-key.pem
   ssh -i devops-key.pem ec2-user@<PUBLIC_IP>

   sudo dnf install -y docker git
   sudo systemctl enable --now docker
   sudo usermod -aG docker ec2-user
   exit          # log out and back in so the docker group takes effect
   ```

---

## Part C: Put the code on GitHub (5 min)

1. Create a **public** repo on GitHub called `devops-demo`.
   (The server clones it without a password. For a private repo, add a deploy key.)
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USER>/devops-demo.git
   git push -u origin main
   ```
   This first push runs build + test. Deploy will fail until Part D is done, which is expected.

---

## Part D: Connect GitHub to AWS (5 min)

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

| Name          | Value                                                     |
|---------------|-----------------------------------------------------------|
| `EC2_HOST`    | your EC2 public IP                                        |
| `EC2_SSH_KEY` | full contents of `devops-key.pem` (including BEGIN/END lines) |

> SSH port 22 must accept GitHub's runners. For learning, set SSH to *Anywhere*
> (0.0.0.0/0) temporarily, and lock it back down when you're done.

---

## Part E: Watch the pipeline go live 🚀

1. Edit `app.js`, e.g. change the `<h1>` text.
2. Push it:
   ```bash
   git commit -am "change heading"
   git push
   ```
3. GitHub → **Actions** tab → watch `build-and-test` then `deploy` turn green.
4. Open `http://<PUBLIC_IP>` in your browser. You'll see your change and the commit version.

### Try breaking it (this is the real lesson)
Change the test in `test/app.test.js` to expect `500` instead of `200`, then push.
→ Tests fail → **deploy is skipped** → your live site stays safe. That is CI/CD.

---

## Clean up (avoid charges)
EC2 → select instance → **Instance state → Terminate**.

## Next level ideas
- Push the image to **Amazon ECR** instead of building on the server
- Use **OIDC + IAM role** instead of SSH keys
- Create the EC2 server with **Terraform**
- Deploy to **ECS Fargate** or **EKS**

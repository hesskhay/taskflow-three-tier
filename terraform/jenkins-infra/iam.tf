
# ==========================================================
# TaskFlow Jenkins Build Agent - IAM Configuration
# ==========================================================

# 1. IAM Role for Jenkins Build Agent EC2 Instance
resource "aws_iam_role" "jenkins_agent_ssm" {
  name = "taskflow-jenkins-agent-ssm-role"

  # Allow EC2 to assume this IAM role
  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Project = "TaskFlow"
    Role    = "JenkinsAgent"
  }
}


# 2. Attach AWS Managed Policy for Systems Manager
resource "aws_iam_role_policy_attachment" "jenkins_agent_ssm" {
  role       = aws_iam_role.jenkins_agent_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}


# 3. IAM Instance Profile for Jenkins Build Agent
resource "aws_iam_instance_profile" "jenkins_agent" {
  name = "taskflow-jenkins-agent-profile"
  role = aws_iam_role.jenkins_agent_ssm.name
}


# 4. IAM Policy for Ansible SSM S3 File Transfers
resource "aws_iam_policy" "ansible_ssm_s3" {
  name        = "taskflow-ansible-ssm-s3-read"
  description = "Allow Jenkins build agent to read Ansible temporary files from S3"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "ReadAnsibleSSMFiles"
        Effect = "Allow"

        Action = [
          "s3:GetObject"
        ]

        Resource = [
          "arn:aws:s3:::taskflow-ansible-ssm-598726482239-us-east-1/*"
        ]
      }
    ]
  })

  tags = {
    Project = "TaskFlow"
    Role    = "AnsibleSSM"
  }
}


# 5. Attach Ansible S3 Policy to Jenkins Agent Role
resource "aws_iam_role_policy_attachment" "ansible_ssm_s3" {
  role       = aws_iam_role.jenkins_agent_ssm.name
  policy_arn = aws_iam_policy.ansible_ssm_s3.arn
}


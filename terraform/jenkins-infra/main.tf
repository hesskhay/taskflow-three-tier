# Dedicated security group for Jenkins build agent
resource "aws_security_group" "jenkins_agent" {
  name_prefix = "taskflow-jenkins-agent-"
  description = "Security group for TaskFlow Jenkins build agent"
  vpc_id      = "vpc-0a6b81a57f7865082"

  # No inbound SSH or Jenkins ports required.
  # The Jenkins agent initiates its connection to the controller.

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "taskflow-jenkins-agent-sg"
  }
}

# Jenkins build-agent EC2 instance
resource "aws_instance" "jenkins_agent" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t3.medium"
  subnet_id                   = "subnet-07599502a2b853548"
  associate_public_ip_address = true

  vpc_security_group_ids = [
    aws_security_group.jenkins_agent.id
  ]

  iam_instance_profile = aws_iam_instance_profile.jenkins_agent.name

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name = "taskflow-jenkins-build-agent"
    Role = "JenkinsAgent"
  }
}


# Reference the existing AWS VPC
data "aws_vpc" "existing" {
  id = "vpc-0a6b81a57f7865082"
}

# Reference the existing subnet
data "aws_subnet" "jenkins" {
  id = "subnet-07599502a2b853548"
}

# Reference the Jenkins controller security group
data "aws_security_group" "controller" {
  id = "sg-096ad619979c0f817"
}

# Reference our dedicated SSH key pair
data "aws_key_pair" "jenkins_agent" {
  key_name = "taskflow-agent-key"
}

# Retrieve the latest Ubuntu 24.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}


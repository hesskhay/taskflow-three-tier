variable "aws_region" {
  description = "AWS region for Jenkins infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "taskflow"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

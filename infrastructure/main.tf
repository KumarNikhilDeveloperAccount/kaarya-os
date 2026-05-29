terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

provider "google" {
  project = "kaarya-os-production"
  region  = "us-central1"
}

# AWS: Elastic Kubernetes Service (EKS) for Swarm scaling
resource "aws_eks_cluster" "kaarya_cluster" {
  name     = "kaarya-os-production-cluster"
  role_arn = "arn:aws:iam::123456789012:role/eks-service-role-kaarya"
  vpc_config {
    subnet_ids = ["subnet-xyz", "subnet-abc"]
  }
}

# GCP: Cloud Run for stateless Next.js Frontend
resource "google_cloud_run_service" "kaarya_frontend" {
  name     = "kaarya-frontend"
  location = "us-central1"
  template {
    spec {
      containers {
        image = "gcr.io/kaarya-os-production/frontend:latest"
      }
    }
  }
}

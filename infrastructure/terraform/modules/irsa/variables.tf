variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "role_name" {
  type        = string
  description = "Name of the IAM role to create"
}

variable "oidc_provider_arn" {
  type        = string
  description = "The ARN of the EKS OIDC provider"
}

variable "oidc_provider_url" {
  type        = string
  description = "The OIDC provider URL (without https:// prefix)"
}

variable "namespace" {
  type        = string
  description = "The target Kubernetes namespace"
}

variable "service_account_name" {
  type        = string
  description = "The target Kubernetes service account name"
}

variable "policy_arn" {
  type        = string
  description = "Pre-existing IAM policy ARN to attach"
  default     = ""
}

variable "policy_json" {
  type        = string
  description = "Inline IAM policy JSON document to create and attach"
  default     = ""
}

resource "random_password" "db_password" {
  length  = 16
  special = false # Avoid special characters that can break database connection strings
}

resource "aws_db_subnet_group" "db_subnet" {
  name        = "${var.project_name}-db-subnet-group"
  subnet_ids  = var.private_subnet_ids
  description = "Private subnets for RDS MySQL database"

  tags = {
    Name        = "${var.project_name}-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "Security group for RDS database allowing ingress only from app nodes"
  vpc_id      = var.vpc_id

  ingress {
    description     = "MySQL from EKS nodes"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [var.app_security_group_id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name        = "${var.project_name}-db-sg"
    Environment = var.environment
  }
}

resource "aws_db_parameter_group" "mysql" {
  name        = "${var.project_name}-mysql-parameters"
  family      = "mysql8.0"
  description = "Custom parameter group for MediGuide MySQL tuning"

  parameter {
    name  = "max_connections"
    value = "200" # Calculated from max pod replicas (6) * connectionLimit (10) = 60 + plenty of headroom.
  }

  tags = {
    Name        = "${var.project_name}-mysql-parameter-group"
    Environment = var.environment
  }
}

resource "aws_db_instance" "mysql" {
  identifier                  = "${var.project_name}-db"
  engine                      = "mysql"
  engine_version              = "8.0"
  instance_class              = var.db_instance_class
  allocated_storage           = var.db_allocated_storage
  storage_type                = "gp3"
  storage_encrypted           = true
  publicly_accessible         = false
  multi_az                    = var.multi_az
  db_name                     = var.db_name
  username                    = var.db_user
  password                    = random_password.db_password.result
  db_subnet_group_name        = aws_db_subnet_group.db_subnet.name
  vpc_security_group_ids      = [aws_security_group.db.id]
  parameter_group_name        = aws_db_parameter_group.mysql.name
  backup_retention_period     = 0
  backup_window               = "03:00-04:00" # UTC backup window
  maintenance_window          = "Sun:04:30-Sun:05:30"
  copy_tags_to_snapshot       = false
  skip_final_snapshot         = true # Set to false in actual production to avoid accidental data loss on destroy.
  auto_minor_version_upgrade  = true

  tags = {
    Name        = "${var.project_name}-db"
    Environment = var.environment
  }
}

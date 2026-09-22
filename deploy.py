import argparse

import boto3


parser = argparse.ArgumentParser(description='Deploy EstateGPT infrastructure with CloudFormation.')
parser.add_argument('--region', default='us-east-1')
parser.add_argument('--stack-name', default='EstateGPT-Production-Stack')
parser.add_argument('--db-username', required=True)
parser.add_argument('--db-password', required=True)
parser.add_argument('--jwt-secret', required=True)
parser.add_argument('--gemini-api-key', default='')
parser.add_argument('--certificate-arn', required=True)
args = parser.parse_args()

print("Initializing AWS CloudFormation client...")
client = boto3.client('cloudformation', region_name=args.region)

stack_name = args.stack_name

with open('aws-infrastructure.yaml', 'r') as file:
    template_body = file.read()

try:
    print(f"Creating CloudFormation stack '{stack_name}'...")
    response = client.create_stack(
        StackName=stack_name,
        TemplateBody=template_body,
        Capabilities=['CAPABILITY_NAMED_IAM'],
        Parameters=[
            {'ParameterKey': 'DBUsername', 'ParameterValue': args.db_username},
            {'ParameterKey': 'DBPassword', 'ParameterValue': args.db_password},
            {'ParameterKey': 'JWTSecret', 'ParameterValue': args.jwt_secret},
            {'ParameterKey': 'GeminiApiKey', 'ParameterValue': args.gemini_api_key},
            {'ParameterKey': 'CertificateArn', 'ParameterValue': args.certificate_arn},
        ],
    )
    print("Stack creation initiated successfully!")
    print(f"Stack ID: {response['StackId']}")
    print("This will take about 10-15 minutes to provision EC2, RDS, VPC, and CloudFront.")
    print("You can view the progress in the AWS Management Console under CloudFormation.")
except Exception as e:
    print(f"Error deploying stack: {e}")

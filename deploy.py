import boto3
import time

# User provided credentials
AWS_ACCESS_KEY_ID = 'YOUR_ACCESS_KEY_HERE'
AWS_SECRET_ACCESS_KEY = 'YOUR_SECRET_KEY_HERE'
AWS_REGION = 'us-east-1'

print("Initializing AWS CloudFormation client...")
client = boto3.client(
    'cloudformation',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

stack_name = 'EstateGPT-Production-Stack'

with open('aws-infrastructure.yaml', 'r') as file:
    template_body = file.read()

try:
    print(f"Creating CloudFormation stack '{stack_name}'...")
    response = client.create_stack(
        StackName=stack_name,
        TemplateBody=template_body,
        Capabilities=['CAPABILITY_NAMED_IAM']
    )
    print("Stack creation initiated successfully!")
    print(f"Stack ID: {response['StackId']}")
    print("This will take about 10-15 minutes to provision EC2, RDS, VPC, and CloudFront.")
    print("You can view the progress in the AWS Management Console under CloudFormation.")
except Exception as e:
    print(f"Error deploying stack: {e}")

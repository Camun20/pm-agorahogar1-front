/**
 * Configuración de Integración con AWS (Cognito, S3, DynamoDB/API Gateway)
 * Mapea las variables expuestas por los outputs de Terraform
 */
export const awsConfig = {
  cognito: {
    userPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID || '',
    userPoolClientId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_CLIENT_ID || '',
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  },
  s3: {
    bucketName: import.meta.env.VITE_AWS_S3_BUCKET_NAME || '',
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  },
  // URL base para el backend en API Gateway
  apiGatewayUrl: import.meta.env.VITE_AWS_API_GATEWAY_URL || '',
};

// Validación en entorno de desarrollo para alertar si faltan variables clave
if (import.meta.env.DEV) {
  const missingKeys: string[] = [];
  if (!awsConfig.cognito.userPoolId) missingKeys.push('VITE_AWS_COGNITO_USER_POOL_ID');
  if (!awsConfig.cognito.userPoolClientId) missingKeys.push('VITE_AWS_COGNITO_USER_POOL_CLIENT_ID');
  if (!awsConfig.s3.bucketName) missingKeys.push('VITE_AWS_S3_BUCKET_NAME');
  
  if (missingKeys.length > 0) {
    console.warn(
      `[AWS Config Warning]: Faltan configurar las siguientes variables de entorno: ${missingKeys.join(', ')}. ` +
      `Asegúrate de copiar los outputs de tu despliegue de Terraform a un archivo .env.`
    );
  }
}

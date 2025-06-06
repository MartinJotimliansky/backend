import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { registerAs } from '@nestjs/config';

function getConfigPath() {
  const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  // Busca el YAML en la carpeta correcta
  return path.resolve(process.cwd(), 'src/config/global/environments', `${env}.yaml`);
}

export default registerAs('yamlConfig', () => {
  const configPath = getConfigPath();
  const file = fs.readFileSync(configPath, 'utf8');
  return yaml.load(file) as Record<string, any>;
});

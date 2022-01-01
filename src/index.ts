import { config as loadDotenv } from 'dotenv';
import { container } from './inversify.config';
import { Mqtt } from './mqtt';
import Types from './types';
loadDotenv();

const mqtt = container.get<Mqtt>(Types.Mqtt);

mqtt.onLocation((location) => console.log(JSON.stringify(location)));

mqtt.connect();

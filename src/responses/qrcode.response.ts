import { ObjectsResponse, PaginatedResponse, SingleObjectResponse } from '@responses/common.response';
import QRCodeSchema from '@schemas/qrcode.schema';
import { ObjectType } from 'type-graphql';

@ObjectType({ description: 'Paginated QR Code response' })
class PaginatedQRCodeResponse extends PaginatedResponse(QRCodeSchema) {}

@ObjectType({ description: 'QR Code response' })
class QRCodeResponse extends SingleObjectResponse(QRCodeSchema) {}

@ObjectType({ description: 'QR Codes response' })
class QRCodesResponse extends ObjectsResponse(QRCodeSchema) {}

export { PaginatedQRCodeResponse, QRCodeResponse, QRCodesResponse };

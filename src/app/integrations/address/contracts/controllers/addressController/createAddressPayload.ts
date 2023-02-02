export interface CreateAddressPayload {
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly country: string;
  readonly state: string;
  readonly city: string;
  readonly zipCode: string;
  readonly streetAddress: string;
  readonly deliveryInstructions?: string;
  readonly customerId?: string;
}

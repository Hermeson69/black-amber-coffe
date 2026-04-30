export default class userModel {
  id: number;
  publicId: string;
  name: string;
  email: string;
  phone: string | null | undefined;
  fullName: string;
  avatarImage: string | null | undefined;
  createdAt: string;
  updatedAt: string;
  profileUpdatedAt: string;

  constructor(
    id: number,
    publicId: string,
    name: string,
    email: string,
    fullName: string,
    phone: string | null | undefined,
    avatarImage: string | null | undefined,
    createdAt: string,
    updatedAt: string,
    profileUpdatedAt: string,
  ) {
    this.id = id;
    this.publicId = publicId;
    this.name = name;
    this.email = email;
    this.fullName = fullName;
    this.phone = phone;
    this.avatarImage = avatarImage;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.profileUpdatedAt = profileUpdatedAt;
  }

  static fromClientAndProfile(client: any, profile: any): userModel {
    return new userModel(
      client.id,
      client.publicId,
      client.name,
      client.email,
      profile?.fullName ?? client.name,
      profile?.phone ?? null,
      profile?.avatarImage ?? null,
      client.createdAt,
      client.updatedAt,
      profile?.updatedAt ?? client.createdAt,
    );
  }
}

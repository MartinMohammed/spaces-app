/**
 * Service class responsible for interacting with the backend data and performing CRUD operations on spaces.
 * This class uses AWS S3 for storing space photos and AWS API Gateway for communicating with the backend API.
 */
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AuthService } from "./AuthService";
import { DataStack, ApiStack } from "../../../server/outputs.json";
import { SpaceEntry } from "../components/model/model";

const spacesUrl = ApiStack.SpacesApiEndpoint36C4F3B6 + "spaces";

export class DataService {
  private authService: AuthService;
  private s3Client: S3Client | undefined;
  private awsRegion = "eu-central-1";

  /**
   * Constructs a new DataService instance with the specified AuthService.
   *
   * @param {AuthService} authService - The AuthService instance used for authentication and obtaining JWT token.
   */
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Reserve a space with the specified space ID.
   *
   * @param {string} spaceId - The ID of the space to reserve.
   * @returns {string} - A placeholder reservation ID. (Actual implementation logic needs to be added.)
   */
  public reserveSpace(spaceId: string) {
    return "123";
  }

  /**
   * Retrieve all spaces from the backend API.
   *
   * @returns {Promise<SpaceEntry[]>} - A promise that resolves to an array of SpaceEntry objects representing the available spaces.
   */
  public async getSpaces(): Promise<SpaceEntry[]> {
    const getSpacesResult = await fetch(spacesUrl, {
      method: "GET",
      headers: {
        Authorization: this.authService.jwtToken!,
      },
    });
    const getSpacesResultJson = await getSpacesResult.json();
    return getSpacesResultJson;
  }

  /**
   * Create a new space with the provided name, location, and optional photo.
   *
   * @param {string} name - The name of the new space.
   * @param {string} location - The location of the new space.
   * @param {File} photo - Optional. The photo file to be uploaded for the new space.
   * @returns {Promise<string>} - A promise that resolves to the ID of the created space.
   */
  public async createSpace(
    name: string,
    location: string,
    photo?: File
  ): Promise<string> {
    const space: any = {};
    space.name = name;
    space.location = location;

    if (photo) {
      const uploadUrl = await this.uploadPublicFile(photo);
      space.photoUrl = uploadUrl;
    }

    const postResult = await fetch(spacesUrl, {
      method: "POST",
      body: JSON.stringify(space),
      headers: {
        Authorization: this.authService.jwtToken!,
      },
    });
    const postResultJSON = await postResult.json();
    return postResultJSON.id;
  }

  /**
   * Upload a public file to the S3 bucket used for storing space photos.
   *
   * @param {File} file - The file to be uploaded to S3.
   * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded file in the S3 bucket.
   */
  private async uploadPublicFile(file: File): Promise<string> {
    const credentials = await this.authService.getTemporaryCredentials();
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        credentials: credentials as any,
        region: this.awsRegion,
      });
    }
    const command = new PutObjectCommand({
      Bucket: DataStack.SpaceFinderPhotosBucketName,
      Key: file.name,
      ACL: "public-read",
      Body: file,
    });
    await this.s3Client.send(command);
    return `https://${command.input.Bucket}.s3.${this.awsRegion}.amazonaws.com/${command.input.Key}`;
  }

  /**
   * Check if the user is authorized and logged in.
   *
   * @returns {boolean} - True if the user is authorized (logged in), otherwise false.
   */
  public isAuthorized() {
    return this.authService.isAuthorized();
  }
}

import * as Keychain from "react-native-keychain";

const SERVICE_NAME = "com.customerapp.tokens";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export const saveTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<boolean> => {
  try {
    const payload = JSON.stringify({ accessToken, refreshToken });
    await Keychain.setGenericPassword("tokens", payload, {
      service: SERVICE_NAME,
    });
    return true;
  } catch {
    return false;
  }
};

export const getTokens = async (): Promise<StoredTokens | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });
    if (credentials && credentials.password) {
      return JSON.parse(credentials.password) as StoredTokens;
    }
    return null;
  } catch {
    return null;
  }
};

export const clearTokens = async (): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
    return true;
  } catch {
    return false;
  }
};

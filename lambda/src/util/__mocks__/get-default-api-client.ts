interface InvokeParams {
  url: string;
  method: 'GET' | 'POST';
  headers: any[];
}

const mockApiClient = {
  invoke({ url, method }: InvokeParams) {
    if (method === 'GET' && url.includes('settings/System.timeZone')) {
      return Promise.resolve({
        body: JSON.stringify({}),
        statusCode: 200,
        headers: [
          {
            key: 'content-type',
            value: 'application/json',
          },
        ],
      });
    } else if (method === 'POST' && url.includes('alerts/reminders')) {
      return Promise.resolve({
        body: JSON.stringify({
          alertToken: 'fakeAlertToken',
        }),
        statusCode: 200,
        headers: [
          {
            key: 'content-type',
            value: 'application/json',
          },
        ],
      });
    } else {
      throw new Error(`Unmocked ${method} request to ${url}`);
    }
  },
};

export const getDefaultApiClient = () => {
  return mockApiClient;
};

import { BloodDonationPage } from './app.po';

describe('blood-donation App', () => {
  let page: BloodDonationPage;

  beforeEach(() => {
    page = new BloodDonationPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});

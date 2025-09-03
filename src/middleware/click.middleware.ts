import * as md5 from 'md5';

const clickCheckToken = (
  data: {
    transId: string;
    serviceId: string;
    orderId: number;
    merchantPrepareId: string;
    amount: string;
    action: string;
    signTime: string;
  },
  signString: string,
) => {
  const {
    transId,
    serviceId,
    orderId,
    merchantPrepareId,
    amount,
    action,
    signTime,
  } = data;
  const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY;
  const prepareId = merchantPrepareId || '';
  const signature = `${transId}${serviceId}${CLICK_SECRET_KEY}${orderId}${prepareId}${amount}${action}${signTime}`;
  console.log(signature);
  const signatureHash = md5(signature);
  return signatureHash === signString;
};

export { clickCheckToken };

import * as crypto from 'crypto';

//------------------ 加密数据 -------------------
const algorithm = 'aes-128-cbc'; // algorithm 是算法的意思

export const encrypt = function (text: string): Promise<string> {
  const password = crypto.randomBytes(16).toString('hex'); // password是用于生产密钥的密码
  const salt = crypto.randomBytes(16).toString('hex'); // 生成盐值
  const iv = crypto.randomBytes(8).toString('hex'); // 初始化向量

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 16, function (err, derivedKey) {
      if (err) {
        reject(err);
      } else {
        const cipher = crypto.createCipheriv(algorithm, derivedKey, iv); // 创建 cipher 实例

        // 加密数据
        let cipherText = cipher.update(text, 'utf8', 'hex');
        cipherText += cipher.final('hex');
        cipherText += password + salt + iv;

        resolve(cipherText);
      }
    });
  });
};

export const decrypt = function (cipherText: string): Promise<string> {
  const iv = cipherText.slice(-16);
  const salt = cipherText.slice(-48, -16);
  const password = cipherText.slice(-80, -48);
  const data = cipherText.slice(0, -80);

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 16, function (err, derivedKey) {
      if (err) {
        reject(err);
      } else {
        const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv);
        let txt = decipher.update(data, 'hex', 'utf8');
        txt += decipher.final('utf8');
        resolve(txt);
      }
    });
  });
};

export const md5 = (input: string) => {
  const hash = crypto.createHash('md5');
  hash.update(input);
  return hash.digest('hex');
};

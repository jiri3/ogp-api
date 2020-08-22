import { NowRequest, NowResponse } from "@vercel/node";
import axios from "axios";
import { JSDOM } from "jsdom";

/**
 * OGPタグを取得して、そのcontentをJSON形式で返す.
 * 使用例:
 *    endpoint/api/ogp?url="サイトのURL"
 *
 * @param req HTTP request
 * @param res HTTP responce
 */
export default async function (req: NowRequest, res: NowResponse) {
  const url = getUrlParameter(req);
  if (!url) {
    errorResponce(res);
    return;
  }

  try {
    const responce = await axios.get(<string>url);
    const data = responce.data;
    const dom = new JSDOM(data);
    const meta = dom.window.document.querySelectorAll("head > meta");

    // metaからOGPを抽出し、JSON形式に変換する
    const ogp = Array.from(meta)
      .filter((element) => element.hasAttribute("property"))
      .reduce((pre, ogp) => {
        const property = ogp.getAttribute("property").trim().replace("og:", "");
        const content = ogp.getAttribute("content");
        pre[property] = content;
        return pre;
      }, {});
    res.status(200).json(ogp);
  } catch (e) {
    errorResponce(res);
  }
}

function isValidUrlParameter(url: string | string[]): boolean {
  return !(url == undefined || url == null || Array.isArray(url));
}

function getUrlParameter(req: NowRequest): string | null {
  const { url } = req.query;
  if (isValidUrlParameter(url)) {
    return <string>url;
  }
  return null;
}

function errorResponce(res: NowResponse): void {
  res.status(400).send("error");
}

import { NextApiRequest, NextApiResponse } from "next";

import { Document } from "@prismicio/client/types/documents";
import { getPrismicClient } from "../../services/prismic";


export function linkResolver(doc: Document) : string {
    if(doc.type === 'posts') {
        return `/post/${doc.uid}`
    }

    return '/';
}

export default async function Preview(req: NextApiRequest, res: NextApiResponse) {
    const { token: ref, documentId } = req.query;
    console.log('ehy')

    const redirectUrl = await getPrismicClient(req)
        .getPreviewResolver(`${ref}`, `${documentId}`)
        .resolve(linkResolver, '/');

        console.log('ehy')
        console.log(redirectUrl)

        if (!redirectUrl) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    
        res.setPreviewData({ ref });
    
        res.write(
            `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
            <script>window.location.href = '${redirectUrl}'</script>
            </head>`
        );

        res.end('Preview enabled');
    return null;
};


import * as React from 'react'
import Link from 'next/link';
import styles from './exitPreviewButton.module.scss';



export function ExitPreviewButton(): JSX.Element  {
    return (
        <>
            <Link href="/api/exit-preview">
                <span className={styles.exitPreview}>Sair do modo Preview</span>
            </Link>
        </>
    )
}
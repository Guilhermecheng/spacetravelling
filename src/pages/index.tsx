import { GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiUser, FiCalendar } from 'react-icons/fi';

import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR/index';

import { useState } from 'react';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
    nome_do_autor: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps): JSX.Element {

  async function fetchingNextPage(nextPage: string) {
    if(nextPage) {

      try {
        const response = await fetch(nextPage);
        const json = await response.json();
        console.log(json)
  
        if(json.message != 'Invalid access token') {
          const formattedResponse = formattingPostsList(json.postsPagination);
          setformattedPageList([...formattedPageList, ...formattedResponse]);
          setPrismicNextPage(json.next_page)
        } else {
          console.log('error')
        }
        
      } catch(err) {
        console.log(err)
      }
    } 
  }

  function formattingPostsList(pagePostList: PostPagination) {
    const pagePosts = pagePostList.results.map((post) => {
      const formattedPublicationDate = format(
        new Date(post.first_publication_date),
        "dd MMM yyyy",
        {
          locale: ptBR
        }
      );

      return {
        uid:post.uid,
        first_publication_date: formattedPublicationDate,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author, 
        }
      }
    })

    return pagePosts
  }

  const [formattedPageList, setformattedPageList] = useState(formattingPostsList(postsPagination));
  const [prismicNextPage, setPrismicNextPage] = useState<string>(postsPagination.next_page);  
  
  return (
    <>
      <Head>
        <title>Home | spacetravelling</title>
      </Head>

      <main className={styles.home}>
        <div className={styles.postsList}>
          {
            formattedPageList.map((page_post) => {

              return(
                <Link href={`/post/${page_post.uid}`} key={page_post.uid}>

                  <a key={page_post.uid} className={styles.postItem}>

                    <h1>{page_post.data.title}</h1>
                    
                    <p>{page_post.data.subtitle}</p>

                    <div className={styles.postCreationInfo}>
                      <span>
                        <FiCalendar />
                        <p>{page_post.first_publication_date}</p>
                      </span>
                      
                      <span>                          
                        <FiUser />
                        <p>{page_post.data.author}</p>
                      </span>
                      
                    </div>
                  </a>
                </Link>
              )
            })
          }

          {prismicNextPage ? (
            <span className={styles.loadMoreBtn} onClick={() => fetchingNextPage(prismicNextPage)}>Carregar mais posts</span>
          ) : (
            <></>
          )}

            {preview && (
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            )}
        
        </div>
      </main>
    </>
  )
  

}

export const getStaticProps: GetStaticProps<HomeProps> = async ({preview = false, previewData}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 5,
    ref: previewData?.ref ?? null,
  });

  console.log(postsResponse)

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: post.data,
      }
    })
  }

  return {
    props: { 
      postsPagination,
      preview
    }
  }
};

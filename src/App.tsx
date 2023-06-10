import { useIntersection } from '@mantine/hooks';
import * as Portal from '@radix-ui/react-portal';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useMemo, useRef } from 'react';
import Loader from 'react-loaders';
import { useLockBodyScroll } from 'react-use';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

let PAGE = 1;

function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery<
    Post[],
    Error
  >({
    refetchOnWindowFocus: false,
    retry: false,
    queryKey: ['posts'],
    async queryFn({ pageParam = PAGE }) {
      return axios
        .get(
          `https://jsonplaceholder.typicode.com/posts?_limit=5&_page=${pageParam}`
        )
        .then(({ data }) => data);
    },
    // getNextPageParam(_, allPages) {
    //   if (allPages[allPages.length - 1].length === 100) {
    //     return undefined;
    //   }
    //   console.log('PAGE_LIMIT:', PAGE_LIMIT);
    //   PAGE_LIMIT += 5;
    //   return PAGE_LIMIT;
    // },
    // initialData: {
    //   pageParams: [PAGE_LIMIT],
    //   pages: [],
    // } as unknown as InfiniteData<Post>,
  });

  useLockBodyScroll(isFetchingNextPage);

  const lastPostRef = useRef<HTMLElement>(null);
  const { entry, ref } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry && entry.isIntersecting) {
      PAGE += 1;
      if (PAGE < 21) {
        fetchNextPage({ pageParam: PAGE });
      }
    }
  }, [entry, fetchNextPage]);

  const _pages = useMemo(() => {
    return data?.pages.flatMap((page) => page);
  }, [data?.pages]);

  return (
    <>
      <div className="container mx-auto mt-16">
        <div className="prose max-w-none">
          <h1>Posts</h1>
          {data ? (
            <>
              <ul className="not-prose pl-0 divide-y divide-gray-200 rounded-xl border border-gray-200 shadow-sm list-none">
                {_pages?.map((post, index) => {
                  return (
                    <li
                      ref={index === _pages.length - 1 ? ref : undefined}
                      key={post.id}
                      className="p-4"
                    >
                      <h4 className="text-lg font-medium leading-loose">
                        {post.id}: {post.title}
                      </h4>
                      <p className="text-gray-500">{post.body}</p>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </div>
      </div>
      {isFetchingNextPage ? (
        <Portal.Root>
          <div className="fixed inset-0 z-10 bg-black bg-opacity-50"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="mx-auto overflow-hidden rounded-lg bg-transparent ">
              <Loader type="line-scale" active />
            </div>
          </div>
        </Portal.Root>
      ) : null}
    </>
  );
}

export default App;

fib :: Integer -> Integer
fib 0 = 0
fib 1 = 1
fib n = fib (n-1) + fib (n-2)

abs :: Int -> Int
abs x
    | x >= 0    =  x
    | otherwise = -x

bap :: Int -> Int
bap x
    | x > 0, x == 0 =  x
    | otherwise = -x

compare :: Int -> Int -> Ordering
compare x y
    | x <  y = LT
    | x == y = EQ
    | x  > y = GT

fromEither :: (a -> c) -> (b -> c) -> Either a b -> c
fromEither f g x = case x of
    Left  l -> f l
    Right r -> g r
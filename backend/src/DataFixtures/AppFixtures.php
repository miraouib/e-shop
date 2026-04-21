<?php

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\Product;
use App\Entity\Promotion;
use App\Entity\Settings;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Settings
        $settings = new Settings();
        $settings->setPrimaryColor('#ef4444');
        $settings->setSecondaryColor('#fca5a5');
        $settings->setFreeShippingThreshold(100);
        $settings->setSiteName('Custom Shop Test');
        $manager->persist($settings);

        // Admin User
        $user = new User();
        $user->setUsername('admin');
        $user->setRoles(['ROLE_ADMIN']);
        $hashedPassword = $this->passwordHasher->hashPassword($user, 'admin');
        $user->setPassword($hashedPassword);
        $manager->persist($user);

        // Categories
        $catCosplay = new Category();
        $catCosplay->setName('Cosplay');
        $catCosplay->setSlug('cosplay');
        $manager->persist($catCosplay);

        $catGaming = new Category();
        $catGaming->setName('Gaming');
        $catGaming->setSlug('gaming');
        $manager->persist($catGaming);

        $catTshirt = new Category();
        $catTshirt->setName('T-shirt');
        $catTshirt->setSlug('t-shirt');
        $manager->persist($catTshirt);

        // Produit 1 : Pas de promotion, prix = 50 DT
        $p1 = new Product();
        $p1->setTranslations([
            'fr' => ['title' => 'Produit 1 (Base)', 'description' => 'Produit standard sans promotion.'],
            'en' => ['title' => 'Product 1 (Base)', 'description' => 'Standard product with no promotion.'],
            'ar' => ['title' => 'المنتج 1 (أساسي)', 'description' => 'منتج قياسي بدون عرض ترويجي.']
        ]);
        $p1->setPrice(50.0);
        $p1->setShippingFee(7.0);
        $p1->setImages(['https://placehold.co/600x600/eee/333?text=Produit+1']);
        $p1->setIsActive(true);
        $p1->setCategory($catCosplay);
        $manager->persist($p1);

        // Produit 2 : Prix base = 100 DT. Promo 40% dès 1 article (-> 60 DT)
        $p2 = new Product();
        $p2->setTranslations([
            'fr' => ['title' => 'Produit 2 (Promo Fixe)', 'description' => 'Produit avec 40% de réduction immédiate.'],
            'en' => ['title' => 'Product 2 (Fixed Promo)', 'description' => 'Product with 40% instant discount.'],
            'ar' => ['title' => 'المنتج 2 (عرض ثابت)', 'description' => 'منتج بخصم 40% فوري.']
        ]);
        $p2->setPrice(100.0);
        $p2->setShippingFee(7.0);
        $p2->setImages(['https://placehold.co/600x600/eee/333?text=Produit+2']);
        $p2->setIsActive(true);
        $p2->setCategory($catGaming);
        $manager->persist($p2);

        $promoP2 = new Promotion();
        $promoP2->setProduct($p2);
        $promoP2->setQuantityThreshold(1);
        $promoP2->setDiscountPrice(60.0);
        $manager->persist($promoP2);

        // Produit 3 : Prix base = 40 DT. 2 -> 35 DT/unité, >=3 -> 28 DT/unité
        $p3 = new Product();
        $p3->setTranslations([
            'fr' => ['title' => 'Produit 3 (Dégressif Fort)', 'description' => 'Achetez plus, payez moins. 1=40DT, 2=70DT, 3=84DT.'],
            'en' => ['title' => 'Product 3 (Volume Discount)', 'description' => 'Buy more, pay less. 1=40DT, 2=70DT, 3=84DT.'],
            'ar' => ['title' => 'المنتج 3 (خصم الكمية)', 'description' => 'اشتر أكثر، ادفع أقل.']
        ]);
        $p3->setPrice(40.0);
        $p3->setShippingFee(7.0);
        $p3->setImages(['https://placehold.co/600x600/eee/333?text=Produit+3']);
        $p3->setIsActive(true);
        $p3->setCategory($catTshirt);
        $manager->persist($p3);

        $promoP3_1 = new Promotion();
        $promoP3_1->setProduct($p3);
        $promoP3_1->setQuantityThreshold(2);
        $promoP3_1->setDiscountPrice(35.0); // 70 / 2 = 35
        $manager->persist($promoP3_1);

        $promoP3_2 = new Promotion();
        $promoP3_2->setProduct($p3);
        $promoP3_2->setQuantityThreshold(3);
        $promoP3_2->setDiscountPrice(28.0);
        $manager->persist($promoP3_2);

        // Produit 4 : Prix base = 100 DT. 1 -> 80 (-20%), 2 -> 70 (-30%), >=3 -> 60 (-40%)
        $p4 = new Product();
        $p4->setTranslations([
            'fr' => ['title' => 'Produit 4 (Multi-Promotions)', 'description' => 'Des promotions pour chaque palier de quantité.'],
            'en' => ['title' => 'Product 4 (Multi-Promotions)', 'description' => 'Promotions for each quantity tier.'],
            'ar' => ['title' => 'المنتج 4 (عروض متعددة)', 'description' => 'عروض ترويجية لكل مستوى كمية.']
        ]);
        $p4->setPrice(100.0);
        $p4->setShippingFee(7.0);
        $p4->setImages(['https://placehold.co/600x600/eee/333?text=Produit+4']);
        $p4->setIsActive(true);
        $p4->setCategory($catCosplay);
        $manager->persist($p4);

        $promoP4_1 = new Promotion();
        $promoP4_1->setProduct($p4);
        $promoP4_1->setQuantityThreshold(1);
        $promoP4_1->setDiscountPrice(80.0);
        $manager->persist($promoP4_1);

        $promoP4_2 = new Promotion();
        $promoP4_2->setProduct($p4);
        $promoP4_2->setQuantityThreshold(2);
        $promoP4_2->setDiscountPrice(70.0);
        $manager->persist($promoP4_2);

        $promoP4_3 = new Promotion();
        $promoP4_3->setProduct($p4);
        $promoP4_3->setQuantityThreshold(3);
        $promoP4_3->setDiscountPrice(60.0);
        $manager->persist($promoP4_3);

        $manager->flush();
    }
}

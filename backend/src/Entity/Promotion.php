<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PromotionRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PromotionRepository::class)]
#[ApiResource]
class Promotion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['product:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['product:read'])]
    private ?int $quantityThreshold = null;

    #[ORM\Column]
    #[Groups(['product:read'])]
    private ?float $discountPrice = null;

    #[ORM\ManyToOne(inversedBy: 'promotions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Product $product = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getQuantityThreshold(): ?int
    {
        return $this->quantityThreshold;
    }

    public function setQuantityThreshold(int $quantityThreshold): static
    {
        $this->quantityThreshold = $quantityThreshold;

        return $this;
    }

    public function getDiscountPrice(): ?float
    {
        return $this->discountPrice;
    }

    public function setDiscountPrice(float $discountPrice): static
    {
        $this->discountPrice = $discountPrice;

        return $this;
    }

    public function getProduct(): ?Product
    {
        return $this->product;
    }

    public function setProduct(?Product $product): static
    {
        $this->product = $product;

        return $this;
    }
}

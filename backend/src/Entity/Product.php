<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use App\Repository\ProductRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['product:read']],
    denormalizationContext: ['groups' => ['product:write']],
    paginationEnabled: true,
    paginationItemsPerPage: 10,
    paginationClientItemsPerPage: true,
    paginationMaximumItemsPerPage: 50
)]
#[ApiFilter(SearchFilter::class, properties: ['category' => 'exact', 'isSlideshow' => 'exact', 'isNewArrival' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['price', 'id', 'slideshowOrder'], arguments: ['orderParameterName' => 'order'])]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['product:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['product:read', 'product:write'])]
    private array $translations = [];

    #[ORM\Column]
    #[Groups(['product:read', 'product:write'])]
    private ?float $price = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?float $originalPrice = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?float $shippingFee = null;

    #[ORM\Column]
    #[Groups(['product:read', 'product:write'])]
    private ?bool $isFreeShipping = false;

    #[ORM\Column(nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?float $freeShippingPriceThreshold = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?int $freeShippingQuantityThreshold = null;

    #[ORM\Column]
    #[Groups(['product:read', 'product:write'])]
    private array $images = [];

    #[ORM\Column]
    #[Groups(['product:read', 'product:write'])]
    private ?bool $isActive = true;

    #[ORM\Column]
    #[Groups(['product:read', 'product:write'])]
    private ?bool $isSlideshow = false;

    #[ORM\Column(nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?int $slideshowOrder = null;

    #[ORM\Column]
    #[Groups(['product:read', 'product:write'])]
    private ?bool $isNewArrival = false;

    #[ORM\ManyToOne(inversedBy: 'products')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['product:read', 'product:write'])]
    private ?Category $category = null;

    #[ORM\OneToMany(mappedBy: 'product', targetEntity: Promotion::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['product:read', 'product:write'])]
    private Collection $promotions;

    #[ORM\OneToMany(mappedBy: 'product', targetEntity: ProductBlock::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['product:read', 'product:write'])]
    private Collection $productBlocks;

    public function __construct()
    {
        $this->promotions = new ArrayCollection();
        $this->productBlocks = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTranslations(): array
    {
        return $this->translations;
    }

    public function setTranslations(array $translations): static
    {
        $this->translations = $translations;

        return $this;
    }

    // Helper for easy access in some contexts
    public function getTitle(string $locale = 'fr'): ?string
    {
        return $this->translations[$locale]['title'] ?? $this->translations['fr']['title'] ?? null;
    }

    public function getDescription(string $locale = 'fr'): ?string
    {
        return $this->translations[$locale]['description'] ?? $this->translations['fr']['description'] ?? null;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getOriginalPrice(): ?float
    {
        return $this->originalPrice;
    }

    public function setOriginalPrice(?float $originalPrice): static
    {
        $this->originalPrice = $originalPrice;

        return $this;
    }

    public function getShippingFee(): ?float
    {
        return $this->shippingFee;
    }

    public function setShippingFee(?float $shippingFee): static
    {
        $this->shippingFee = $shippingFee;

        return $this;
    }

    public function isFreeShipping(): ?bool
    {
        return $this->isFreeShipping;
    }

    public function setIsFreeShipping(bool $isFreeShipping): static
    {
        $this->isFreeShipping = $isFreeShipping;

        return $this;
    }

    public function getFreeShippingPriceThreshold(): ?float
    {
        return $this->freeShippingPriceThreshold;
    }

    public function setFreeShippingPriceThreshold(?float $freeShippingPriceThreshold): static
    {
        $this->freeShippingPriceThreshold = $freeShippingPriceThreshold;

        return $this;
    }

    public function getFreeShippingQuantityThreshold(): ?int
    {
        return $this->freeShippingQuantityThreshold;
    }

    public function setFreeShippingQuantityThreshold(?int $freeShippingQuantityThreshold): static
    {
        $this->freeShippingQuantityThreshold = $freeShippingQuantityThreshold;

        return $this;
    }

    public function getImages(): array
    {
        return $this->images;
    }

    public function setImages(array $images): static
    {
        $this->images = $images;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function isSlideshow(): ?bool
    {
        return $this->isSlideshow;
    }

    public function setIsSlideshow(bool $isSlideshow): static
    {
        $this->isSlideshow = $isSlideshow;

        return $this;
    }

    public function getSlideshowOrder(): ?int
    {
        return $this->slideshowOrder;
    }

    public function setSlideshowOrder(?int $slideshowOrder): static
    {
        $this->slideshowOrder = $slideshowOrder;

        return $this;
    }

    public function isNewArrival(): ?bool
    {
        return $this->isNewArrival;
    }

    public function setIsNewArrival(bool $isNewArrival): static
    {
        $this->isNewArrival = $isNewArrival;

        return $this;
    }

    /**
     * @return Collection<int, Promotion>
     */
    public function getPromotions(): Collection
    {
        return $this->promotions;
    }

    public function addPromotion(Promotion $promotion): static
    {
        if (!$this->promotions->contains($promotion)) {
            $this->promotions->add($promotion);
            $promotion->setProduct($this);
        }

        return $this;
    }

    public function removePromotion(Promotion $promotion): static
    {
        if ($this->promotions->removeElement($promotion)) {
            // set the owning side to null (unless already changed)
            if ($promotion->getProduct() === $this) {
                $promotion->setProduct(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ProductBlock>
     */
    public function getProductBlocks(): Collection
    {
        return $this->productBlocks;
    }

    public function addProductBlock(ProductBlock $productBlock): static
    {
        if (!$this->productBlocks->contains($productBlock)) {
            $this->productBlocks->add($productBlock);
            $productBlock->setProduct($this);
        }

        return $this;
    }

    public function removeProductBlock(ProductBlock $productBlock): static
    {
        if ($this->productBlocks->removeElement($productBlock)) {
            // set the owning side to null (unless already changed)
            if ($productBlock->getProduct() === $this) {
                $productBlock->setProduct(null);
            }
        }

        return $this;
    }
}

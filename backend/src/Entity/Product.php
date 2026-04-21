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
    normalizationContext: ['groups' => ['product:read']]
)]
#[ApiFilter(SearchFilter::class, properties: ['category' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['price', 'id'], arguments: ['orderParameterName' => 'order'])]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['product:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['product:read'])]
    private array $translations = [];

    #[ORM\Column]
    #[Groups(['product:read'])]
    private ?float $price = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['product:read'])]
    private ?float $shippingFee = null;

    #[ORM\Column]
    #[Groups(['product:read'])]
    private array $images = [];

    #[ORM\Column]
    #[Groups(['product:read'])]
    private ?bool $isActive = true;

    #[ORM\ManyToOne(inversedBy: 'products')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['product:read'])]
    private ?Category $category = null;

    #[ORM\OneToMany(mappedBy: 'product', targetEntity: Promotion::class, cascade: ['persist', 'remove'])]
    #[Groups(['product:read'])]
    private Collection $promotions;

    public function __construct()
    {
        $this->promotions = new ArrayCollection();
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

    public function getShippingFee(): ?float
    {
        return $this->shippingFee;
    }

    public function setShippingFee(?float $shippingFee): static
    {
        $this->shippingFee = $shippingFee;

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
}

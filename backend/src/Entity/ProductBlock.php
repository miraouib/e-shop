<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\ProductBlockRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;

#[ORM\Entity(repositoryClass: ProductBlockRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(),
        new Put(),
        new Patch(),
        new Delete()
    ],
    normalizationContext: ['groups' => ['product_block:read']],
    denormalizationContext: ['groups' => ['product_block:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['product' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['position'], arguments: ['orderParameterName' => 'order'])]
class ProductBlock
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['product_block:read', 'product:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['product_block:read', 'product_block:write', 'product:read'])]
    private array $translations = [];

    #[ORM\Column(length: 1024, nullable: true)]
    #[Groups(['product_block:read', 'product_block:write', 'product:read'])]
    private ?string $image = null;

    #[ORM\Column]
    #[Groups(['product_block:read', 'product_block:write', 'product:read'])]
    private ?bool $isActive = true;

    #[ORM\Column]
    #[Groups(['product_block:read', 'product_block:write', 'product:read'])]
    private ?int $position = 0;

    #[ORM\ManyToOne(inversedBy: 'productBlocks')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['product_block:read', 'product_block:write'])]
    private ?Product $product = null;

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

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): static
    {
        $this->image = $image;

        return $this;
    }

    public function isIsActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(int $position): static
    {
        $this->position = $position;

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

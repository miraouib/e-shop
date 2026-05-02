<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ThemeRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ThemeRepository::class)]
#[ApiResource]
class Theme
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $primaryColor = null;

    #[ORM\Column(length: 255)]
    private ?string $secondaryColor = null;

    #[ORM\Column(length: 255)]
    private ?string $tertiaryColor = null;

    #[ORM\Column]
    private ?bool $isActive = null;

    #[ORM\Column(length: 255)]
    private ?string $cardColor = null;

    #[ORM\Column(length: 255)]
    private ?string $formBgColor = null;

    #[ORM\Column(length: 255)]
    private ?string $formTextColor = null;

    #[ORM\Column(length: 255)]
    private ?string $headerTextColor = null;

    #[ORM\Column(length: 255)]
    private ?string $footerTextColor = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getPrimaryColor(): ?string
    {
        return $this->primaryColor;
    }

    public function setPrimaryColor(string $primaryColor): static
    {
        $this->primaryColor = $primaryColor;

        return $this;
    }

    public function getSecondaryColor(): ?string
    {
        return $this->secondaryColor;
    }

    public function setSecondaryColor(string $secondaryColor): static
    {
        $this->secondaryColor = $secondaryColor;

        return $this;
    }

    public function getTertiaryColor(): ?string
    {
        return $this->tertiaryColor;
    }

    public function setTertiaryColor(string $tertiaryColor): static
    {
        $this->tertiaryColor = $tertiaryColor;

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

    public function getCardColor(): ?string
    {
        return $this->cardColor;
    }

    public function setCardColor(string $cardColor): static
    {
        $this->cardColor = $cardColor;

        return $this;
    }

    public function getFormBgColor(): ?string
    {
        return $this->formBgColor;
    }

    public function setFormBgColor(string $formBgColor): static
    {
        $this->formBgColor = $formBgColor;

        return $this;
    }

    public function getFormTextColor(): ?string
    {
        return $this->formTextColor;
    }

    public function setFormTextColor(string $formTextColor): static
    {
        $this->formTextColor = $formTextColor;

        return $this;
    }

    public function getHeaderTextColor(): ?string
    {
        return $this->headerTextColor;
    }

    public function setHeaderTextColor(string $headerTextColor): static
    {
        $this->headerTextColor = $headerTextColor;

        return $this;
    }

    public function getFooterTextColor(): ?string
    {
        return $this->footerTextColor;
    }

    public function setFooterTextColor(string $footerTextColor): static
    {
        $this->footerTextColor = $footerTextColor;

        return $this;
    }
}

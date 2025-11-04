<?php
namespace OpenCATS\Entity;

class Company
{
    private $siteId;
    private $name;
    private $address;
    private $city;
    private $country;
    private $phoneNumber;
    private $url;
    private $keyTechnologies;
    private $isHot;
    private $notes;
    private $enteredBy;
    private $owner;
    
    function __construct($siteId, $name)
    {
        $this->siteId = $siteId;
        $this->name = $name;
    }
    
    function getSiteId()
    {
        return $this->siteId;
    }
    
    function getName()
    {
        return $this->name;
    }
    
    function setAddress($value)
    {
        $this->address = $value;
    }
    
    function getAddress()
    {
        return $this->address;
    }
    
    function setCity($value)
    {
        $this->city = $value;
    }
    
    function getCity()
    {
        return $this->city;
    }
    
    function setCountry($value)
    {
        $this->country = $value;
    }
    
    function getCountry()
    {
        return $this->country;
    }
    
    function setPhoneNumber($value)
    {
        $this->phoneNumber = $value;
    }
    
    function getPhoneNumber()
    {
        return $this->phoneNumber;
    }

    // TODO: URL should be renamed to Website as URL is a technical but a business concept
    function setUrl($value)
    {
        $this->url = $value;
    }
    
    function getUrl()
    {
        return $this->url;
    }
    
    function setKeyTechnologies($value)
    {
        $this->keyTechnologies = $value;
    }
    
    function getKeyTechnologies()
    {
        return $this->keyTechnologies;
    }
    
    function setIsHot($value)
    {
        $this->isHot = $value;
    }
    
    function isHot()
    {
        return $this->isHot;
    }
    
    function setNotes($value)
    {
        $this->notes = $value;
    }
    
    function getNotes()
    {
        return $this->notes;
    }
    
    // TODO: Rename EnteredBy to EnteredByUser, to make it explicit that's
    // awaiting for a user id
    function setEnteredBy($value)
    {
        $this->enteredBy = $value;
    }
    
    function getEnteredBy()
    {
        return $this->enteredBy;
    }
    
    // TODO: Make explicit that the owner is a user
    function setOwner($value)
    {
        $this->owner = $value;
    }
    
    function getOwner()
    {
        return $this->owner;
    }
    
    static function create(
        $siteId,
        $name,
        $address,
        $city,
        $country,
        $phoneNumber,
        $url,
        $keyTechnologies,
        $isHot,
        $notes,
        $enteredBy,
        $owner
    )
    {
        $company = new Company($siteId, $name);
        $company->setAddress($address);
        $company->setCity($city);
        $company->setCountry($country);
        $company->setPhoneNumber($phoneNumber);
        $company->setUrl($url);
        $company->setKeyTechnologies($keyTechnologies);
        $company->setIsHot($isHot);
        $company->setNotes($notes);
        $company->setEnteredBy($enteredBy);
        $company->setOwner($owner);
        return $company;
    }
}
